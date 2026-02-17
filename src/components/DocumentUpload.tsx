import { useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createApiClient } from "../apiClient";

type UploadResponse = {
  documentId: string;
  fileName: string;
  pageCount: number;
  textPreview: string; // first N chars
};

export default function DocumentUpload() {
  const { getToken } = useAuth();
  const api = useMemo(() => createApiClient(getToken), [getToken]);

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onUpload() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post<UploadResponse>("/api/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Upload FNOL PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={onUpload}
        disabled={!file || busy}
        style={{ marginLeft: 12, padding: "6px 10px" }}
      >
        {busy ? "Uploading…" : "Upload"}
      </button>

      {error && <div style={{ color: "crimson", marginTop: 12 }}>Error: {error}</div>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <div><b>Document:</b> {result.fileName}</div>
          <div><b>Doc ID:</b> {result.documentId}</div>
          <div><b>Pages:</b> {result.pageCount}</div>

          <div style={{ marginTop: 8 }}>
            <b>Text preview:</b>
            <pre style={{ background: "#111", color: "#ddd", padding: 12, borderRadius: 8, overflowX: "auto" }}>
              {result.textPreview}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
