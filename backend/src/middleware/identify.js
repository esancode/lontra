const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const identify = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];

  if (!deviceId || deviceId.trim() === '') {
    return res.status(400).json({ error: 'Identificador de dispositivo ausente.' });
  }

  if (!UUID_REGEX.test(deviceId.trim())) {
    return res.status(400).json({ error: 'Identificador de dispositivo inválido.' });
  }

  req.ownerId = deviceId.trim();
  next();
};
