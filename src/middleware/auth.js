const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    // 1. Buscar el pase de acceso
    const token = req.headers.authorization?.split(' ')[1]

    // 2. Si no hay pase → error
    if(!token) {
      return res.status(401).json({ 
        error: 'No tienes pase de acceso' 
      })
    }

    // 3. Verificar que el pase sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. Guardar el id del visitante
    //    en el request para usarlo después
    req.userId = decoded.userId

    // 5. Dejar pasar
    next()

  } catch(error) {
    res.status(401).json({ error: 'Pase inválido' })
  }
}