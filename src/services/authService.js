const jwt = require('jsonwebtoken');

// Clave secreta (se recomienda usar variables de entorno)
const SECRET_KEY = process.env.JWT_SECRET || "tu_clave_secreta";

// Generar un token
const generateToken = (user) => {
    return jwt.sign(
        { email: user.email }, // Payload con datos del usuario
        SECRET_KEY,            // Clave secreta
        { expiresIn: '1h' }    // Expiración del token
    );
};

// Verificar un token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Leer el token del encabezado
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Almacena los datos decodificados en la solicitud
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

module.exports = { generateToken, verifyToken };
