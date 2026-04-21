import { useEffect, useState } from "react";
import { Table, Button, Tree, Upload, Input, Tag, Space, message, Modal, Form, Popconfirm } from "antd";
import { UploadOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import documentService, { type DocFolder, type DocItem } from "../../services/documentService";
import type { PaginatedResponse } from "../../services/productService";
import useAuthStore from "../../store/authStore";

const docTypeMap: Record<string, string> = {
  "/documents/design": "DESIGN",
  "/documents/training": "TRAINING",
  "/documents/certificates": "CERTIFICATE",
};
const docTypeLabel: Record<string, string> = { DESIGN: "设计资源", TRAINING: "培训资料", CERTIFICATE: "资质文件" };

export default function DocumentListPage() {
  const location = useLocation();
  const docType = docTypeMap[location.pathname] || "DESIGN";
  const [data, setData] = useState<PaginatedResponse<DocItem>>({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<DocFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderForm] = Form.useForm();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");

  const fetchTree = () => documentService.getFolderTree(docType).then(({ data }) => setTree(data));
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { doc_type: docType, page: String(page) };
      if (selectedFolder) params.folder = selectedFolder;
      if (search) params.search = search;
      const { data: res } = await documentService.getDocuments(params);
      setData(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTree(); setSelectedFolder(undefined); setPage(1); }, [docType]);
  useEffect(() => { fetchDocs(); }, [page, selectedFolder, docType]);

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", docType);
    if (selectedFolder) fd.append("folder", selectedFolder);
    await documentService.uploadDocument(fd);
    message.success("上传成功");
    fetchDocs();
    return false;
  };

  const handleDownload = async (doc: DocItem) => {
    const { data: blob } = await documentService.downloadDocument(doc.id);
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");
    a.href = url; a.download = doc.name; a.click();
    URL.revokeObjectURL(url);
  };

  const isPreviewable = (mime: string) =>
    mime.startsWith("image/") || mime === "application/pdf" || mime.startsWith("audio/") || mime.startsWith("video/");

  const handlePreview = (doc: DocItem) => {
    const url = `/media/${doc.file_path}`;
    if (doc.mime_type.startsWith("image/")) {
      Modal.info({ title: doc.name, width: 800, content: <img src={url} style={{ width: "100%" }} /> });
    } else if (doc.mime_type === "application/pdf") {
      window.open(url, "_blank");
    } else if (doc.mime_type.startsWith("audio/")) {
      Modal.info({ title: doc.name, content: <audio controls src={url} style={{ width: "100%" }} /> });
    } else if (doc.mime_type.startsWith("video/")) {
      Modal.info({ title: doc.name, width: 800, content: <video controls src={url} style={{ width: "100%" }} /> });
    }
  };

  const mapTree = (nodes: DocFolder[]): any[] =>
    nodes.map((n) => ({
      title: (
        <Space>
          <span>{n.name}</span>
          {isAdmin && (
            <Popconfirm title="删除文件夹？" onConfirm={async (e) => { e?.stopPropagation(); await documentService.deleteFolder(n.id); message.success("已删除"); fetchTree(); }}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
            </Popconfirm>
          )}
        </Space>
      ),
      key: String(n.id),
      children: n.children ? mapTree(n.children) : [],
    }));

  const columns = [
    { title: "文件名", dataIndex: "name", render: (name: string, r: DocItem) => (
      <a onClick={() => isPreviewable(r.mime_type) ? handlePreview(r) : handleDownload(r)}>{name}</a>
    )},
    { title: "大小", dataIndex: "file_size", width: 100, render: (v: number) => v > 1048576 ? `${(v / 1048576).toFixed(1)} MB` : `${(v / 1024).toFixed(0)} KB` },
    { title: "标签", dataIndex: "tags", render: (tags: string[]) => tags?.map((t) => <Tag key={t}>{t}</Tag>) },
    { title: "上传人", dataIndex: "created_by_name", width: 100 },
    { title: "操作", width: 120, render: (_: unknown, r: DocItem) => (
      <Space>
        <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(r)} />
        {isAdmin && <Popconfirm title="删除？" onConfirm={async () => { await documentService.deleteDocument(r.id); message.success("已删除"); fetchDocs(); }}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>}
      </Space>
    )},
  ];

  return (
    <div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>{docTypeLabel[docType]}</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <Space direction="vertical" style={{ width: "100%", marginBottom: 8 }}>
            {isAdmin && <Button icon={<PlusOutlined />} block onClick={() => { folderForm.resetFields(); setFolderModalOpen(true); }}>新建文件夹</Button>}
          </Space>
          <Tree treeData={mapTree(tree)} onSelect={(keys) => { setSelectedFolder(keys[0] as string); setPage(1); }} selectedKeys={selectedFolder ? [selectedFolder] : []} defaultExpandAll />
        </div>
        <div style={{ flex: 1 }}>
          <Space style={{ marginBottom: 16 }}>
            <Input placeholder="搜索文件..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={fetchDocs} allowClear style={{ width: 240 }} />
            <Upload showUploadList={false} beforeUpload={handleUpload}><Button icon={<UploadOutlined />}>上传文件</Button></Upload>
          </Space>
          <Table columns={columns} dataSource={data.results} rowKey="id" loading={loading}
            pagination={{ current: page, total: data.count, pageSize: 20, onChange: setPage }} />
        </div>
      </div>
      <Modal title="新建文件夹" open={folderModalOpen} onOk={async () => {
        const values = await folderForm.validateFields();
        await documentService.createFolder({ name: values.name, doc_type: docType, parent: selectedFolder ? Number(selectedFolder) : null });
        message.success("已创建"); setFolderModalOpen(false); fetchTree();
      }} onCancel={() => setFolderModalOpen(false)}>
        <Form form={folderForm} layout="vertical">
          <Form.Item name="name" label="文件夹名称" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
