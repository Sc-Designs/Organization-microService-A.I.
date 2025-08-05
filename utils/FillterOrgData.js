const fillterOrgData = (orgData) => {
  const { 
    __v, 
    updatedAt, 
    otp, 
    otpExpiry, 
    profileImagePublicId,
    ...org } = orgData._doc;

    return org;
};

export default fillterOrgData;