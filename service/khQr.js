import { khqrData, BakongKHQR, IndividualInfo } from 'bakong-khqr';

const SUCCESS_CODE = 200;
const FAIL_REQUEST_CODE = 400;
const generateKhqrData = async (req, res) => {
  try {
    const {
      price,
      currency,
      sportcCenterName,
      mobileNumber,
      bakongAccount,
      bakongAccountName,
    } = req.body;

    const KHQR = BakongKHQR;
    let getCurrency = '';

    if (currency === 'usd') {
      getCurrency = khqrData.currency.usd;
    } else if (currency === 'khr') {
      getCurrency = khqrData.currency.khr;
    }

    if (KHQR) {
      const optionalData = {
        currency: getCurrency,
        amount: price,
        mobileNumber: `855${mobileNumber}`,
        storeLabel: sportcCenterName,
        terminalLabel: 'Sport Center',
        purposeOfTransaction: 'oversea',
        languagePreference: 'km',
        merchantNameAlternateLanguage: 'ចន សីន',
        merchantCityAlternateLanguage: 'សៀមរាប',
      };

      const individualInfo = new IndividualInfo(
        bakongAccount,
        bakongAccountName,
        khqrData.currency.usd,
        optionalData,
      );

      const khqr = new BakongKHQR();
      const individualQr = khqr.generateIndividual(individualInfo);

      if (!individualQr)
        return res.staus(404).json({
          message: 'QR is not available',
        });

      const isKHQR = BakongKHQR.verify(individualQr?.data?.qr).isValid;

      if (!isKHQR) {
        return res.status(FAIL_REQUEST_CODE).json({
          message: 'QR is invalid',
        });
      }

      res.status(SUCCESS_CODE).json({
        individual_qr: individualQr,
      });
    }
  } catch (e) {
    console.error('Error generating KHQR data:', e.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { generateKhqrData };
