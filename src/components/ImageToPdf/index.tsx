import React, { useState } from "react";
import jsPDF from "jspdf";
import imageCompression from "browser-image-compression";
import "./style.css"

const MAX_IMAGES = 20; // Limite máximo de imagens

const ImageToPdf = () => {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1, 
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedFiles = Array.from(e.target.files);

      if (uploadedFiles.length > MAX_IMAGES) {
        alert(`Você pode carregar no máximo ${MAX_IMAGES} imagens.`);
        return;
      }

      setLoading(true);
      const compressedFiles = await Promise.all(
        uploadedFiles.map((file) => compressImage(file))
      );
      setImages(compressedFiles);
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    const pdf = new jsPDF();

    for (const [index, image] of images.entries()) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          if (e.target && e.target.result) {
            const img = new Image();
            img.src = e.target.result as string;
            img.onload = () => {
              const imgWidth = 210;
              const imgHeight = (img.height * imgWidth) / img.width;
              if (index > 0) pdf.addPage();
              pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);
              resolve();
            };
          }
        };
        reader.readAsDataURL(image);
      });
    }

    pdf.save("converted.pdf");
    setImages([]);
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">Imagem para PDF</h1>
      <input
        type="file"
        accept="image/jpeg, image/png"
        multiple
        onChange={handleUpload}
        className="upload-input"
        key={images.length}
      />
      <button
        onClick={generatePDF}
        className={`convert-button ${loading ? "loading" : ""}`}
        disabled={images.length === 0 || loading}
      >
        {loading ? "Processando..." : "Converter para PDF"}
      </button>
      <div className="image-grid">
        {images.map((file, index) => (
          <img
            key={index}
            src={URL.createObjectURL(file)}
            alt="preview"
            className="image-preview"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageToPdf;
