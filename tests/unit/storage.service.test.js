import { describe, it, expect, vi, beforeEach } from "vitest";

const s3Client = require("../../src/config/S3");
const presigner = require("@aws-sdk/s3-request-presigner");

const { uploadPdf, genererUrlTelechargement } = require("../../src/services/storageService");

vi.spyOn(s3Client, "send");
vi.spyOn(presigner, "getSignedUrl");

describe("StorageService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("envoie le PDF et retourne les métadonnées", async () => {
    s3Client.send.mockResolvedValue({});

    const buffer = Buffer.from("contenu PDF");
    const key = "orders/2026/TRP-123.pdf";

    const resultat = await uploadPdf({ key, buffer });

    expect(s3Client.send).toHaveBeenCalledOnce();

    const commande = s3Client.send.mock.calls[0][0];

    expect(commande.input.Bucket).toBe(
      process.env.S3_BUCKET || "fleettrack-documents"
    );
    expect(commande.input.Key).toBe(key);
    expect(commande.input.Body).toEqual(buffer);
    expect(commande.input.ContentType).toBe("application/pdf");

    expect(resultat).toEqual({
      bucket: process.env.S3_BUCKET || "fleettrack-documents",
      s3Key: key,
      sizeBytes: buffer.length,
    });
  });

  it("refuse une clé vide", async () => {
    await expect(
      uploadPdf({ key: "", buffer: Buffer.from("PDF") })
    ).rejects.toThrow(
      "Une clé S3 et un Buffer PDF sont obligatoires"
    );

    expect(s3Client.send).not.toHaveBeenCalled();
  });

  it("refuse un contenu qui n'est pas un Buffer", async () => {
    await expect(
      uploadPdf({
        key: "orders/test.pdf",
        buffer: "contenu invalide",
      })
    ).rejects.toThrow(
      "Une clé S3 et un Buffer PDF sont obligatoires"
    );

    expect(s3Client.send).not.toHaveBeenCalled();
  });

  it("génère une URL signée avec une expiration de 15 minutes", async () => {
    const url = "https://example.test/temporary-url";
    presigner.getSignedUrl.mockResolvedValue(url);

    const resultat = await genererUrlTelechargement(
      "orders/2026/TRP-123.pdf"
    );

    expect(resultat).toBe(url);
    expect(presigner.getSignedUrl).toHaveBeenCalledOnce();

    const [client, commande, options] =
      presigner.getSignedUrl.mock.calls[0];

    expect(client).toBe(s3Client);
    expect(commande.input.Bucket).toBe(
      process.env.S3_BUCKET || "fleettrack-documents"
    );
    expect(commande.input.Key).toBe(
      "orders/2026/TRP-123.pdf"
    );
    expect(options).toEqual({ expiresIn: 900 });
  });

  it("propage une erreur d'upload S3", async () => {
    s3Client.send.mockRejectedValue(new Error("S3 indisponible"));

    await expect(
      uploadPdf({
        key: "orders/2026/TRP-123.pdf",
        buffer: Buffer.from("PDF"),
      })
    ).rejects.toThrow("S3 indisponible");
  });
});
