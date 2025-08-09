const fillterOrgData = (orgData, lean = false) => {
  const source = lean ? orgData : orgData._doc;
  const {
    __v,
    updatedAt,
    otp,
    otpExpiry,
    profileImagePublicId,
    password,
    ...org
  } = source;

    return org;
};

export default fillterOrgData;