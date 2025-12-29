// middleware/logger.js
const logger = (req, res, next) => {
    const time = new Date().toLocaleString('vi-VN');
    const method = req.method; // GET, POST...
    const url = req.originalUrl; // /api/flights...

    console.log(`📝 [LOG] ${time} | ${method} ${url}`);
    
    next(); 
};

module.exports = logger;