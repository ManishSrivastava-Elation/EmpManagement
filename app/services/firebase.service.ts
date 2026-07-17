import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type OtpConfirmation = FirebaseAuthTypes.ConfirmationResult;

/** Sends OTP to the given E.164 phone number (e.g. "+917267895432"). */
export const sendOtp = async (phone: string): Promise<OtpConfirmation> => {
  return auth().signInWithPhoneNumber(phone);
};

/** Confirms phone OTP using the verificationId string. */
export const confirmOtp = async (
  verificationId: string,
  code: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  const credential = auth.PhoneAuthProvider.credential(verificationId, code);
  return auth().signInWithCredential(credential);
};
