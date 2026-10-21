const { genererPdfTrajetBuffer } = require("./pdfService");
const { uploadPdf } = require("./storageService");

const archiverOrdreMission = async (trajet) => {
  const buffer = await genererPdfTrajetBuffer(trajet);

  const annee = new Date(trajet.dateDepart).getFullYear();
  const reference = `TRP-${trajet._id}`;
  const key = `orders/${annee}/${reference}.pdf`;

  const metadata = await uploadPdf({ key, buffer });

  return metadata;
};

module.exports = { archiverOrdreMission };
