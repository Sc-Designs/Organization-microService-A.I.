const fillterOrgData = (orgData, lean = false) => {
  const source = lean ? orgData : orgData._doc;
  const { 
    __v, 
    updatedAt, 
    otp, 
    otpExpiry, 
    profileImagePublicId,
    ...org } = source;

    return org;
};

export default fillterOrgData;