const PARTNER_REGISTRATION_TYPES = ["partnership", "llp"];
const DIRECTOR_REGISTRATION_TYPES = [
  "private limited company",
  "public limited company",
  "section 8 company",
  "others",
];

const normalizeRegistrationType = (registrationType = "") =>
  registrationType.trim().toLowerCase();

export const getPromoterRole = (registrationType) => {
  const normalizedType = normalizeRegistrationType(registrationType);

  if (PARTNER_REGISTRATION_TYPES.includes(normalizedType)) {
    return "partner";
  }

  if (DIRECTOR_REGISTRATION_TYPES.includes(normalizedType)) {
    return "director";
  }

  return "proprietor";
};

export const getPromoterRoleLabel = (registrationType, count = 1) => {
  const role = getPromoterRole(registrationType);
  const isPlural = Number(count) > 1;

  if (role === "partner") {
    return isPlural ? "Partners" : "Partner";
  }

  if (role === "director") {
    return isPlural ? "Directors" : "Director";
  }

  return "Proprietor";
};

export const getPromoterNameLabel = (registrationType, count = 1) =>
  `${getPromoterRoleLabel(registrationType, count)} Name`;

export const getPromoterNameOfLabel = (registrationType, count = 1) =>
  `Name of ${getPromoterRoleLabel(registrationType, count)}`;

export const getPromoterAadhaarLabel = (
  registrationType,
  count = 1,
  prefix = "Aadhar"
) => `${prefix} of ${getPromoterRoleLabel(registrationType, count)}`;

export const getPromoterDinLabel = (registrationType, count = 1) => {
  const role = getPromoterRole(registrationType);
  const roleLabel = getPromoterRoleLabel(registrationType, count);

  if (role === "partner") {
    return `DPIN of ${roleLabel}`;
  }

  if (role === "director") {
    return `DIN of ${roleLabel}`;
  }

  return "DIN";
};

export const getAddPromoterLabel = (registrationType) =>
  `Add ${getPromoterRoleLabel(registrationType)}`;

export const getPromoterNames = (accountInformation = {}, fallback = "") => {
  const names = [];
  const primaryName = accountInformation?.businessOwner?.trim();
  const role = getPromoterRole(accountInformation?.registrationType);

  if (primaryName) {
    names.push(primaryName);
  }

  if (role !== "proprietor" && Array.isArray(accountInformation?.allPartners)) {
    accountInformation.allPartners.forEach((promoter) => {
      const promoterName = promoter?.partnerName?.trim();

      if (promoterName) {
        names.push(promoterName);
      }
    });
  }

  const uniqueNames = names.filter(
    (name, index, list) =>
      list.findIndex(
        (item) => item.toLowerCase() === name.toLowerCase()
      ) === index
  );

  return uniqueNames.length > 0 ? uniqueNames.join(", ") : fallback;
};

export const getPromoterCount = (accountInformation = {}) => {
  const names = getPromoterNames(accountInformation);

  return names ? names.split(",").filter((name) => name.trim()).length : 1;
};
