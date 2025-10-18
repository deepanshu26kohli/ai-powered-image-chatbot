"use client";
import { useState } from "react";
import { Upload, Card, message, Image } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

export default function UploadCard({ onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setPreview(URL.createObjectURL(file)); // 👈 set preview

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/upload", formData);
      onExtracted(res.data.text);
      message.success("Text extracted!");
    } catch (e) {
      message.error("OCR failed");
    }
    setLoading(false);
    return false;
  };

  return (
    <Card className="glass p-6 w-full max-w-md text-center">
      <Upload.Dragger
        beforeUpload={handleUpload}
        showUploadList={false}
        accept="image/*"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag image to upload
        </p>
      </Upload.Dragger>

      {preview && (
        <div className="mt-4">
          <Image
            src={preview}
            alt="Uploaded"
            className="rounded-xl shadow-lg"
            style={{ maxHeight: 250, objectFit: "cover" }}
          />
        </div>
      )}
    </Card>
  );
}
