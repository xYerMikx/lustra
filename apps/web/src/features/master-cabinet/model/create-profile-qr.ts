import QRCode from 'qrcode'

const QR_SIZE = 1024

export async function createProfileQrPng(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    type: 'image/png',
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

export async function createProfileQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}
