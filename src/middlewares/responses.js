const responses = (req, res, next) => {
    res.ok = (results) => {
        if (results) {            
            return res.status(200).json(results);
        } else {
            return res.status(200).send('ok');
        }
    };

    res.success = (results) => {
        return res.status(201).json(results);
    };

    res.badRequest = (message = 'Bad Request') => {
        return res.status(400).json({
            error: true,
            message: message,
            type: 'BAD_REQUEST'
        });
    };

    res.unAuthorised = (message = 'Unauthorised') => {
        return res.status(401).json({
            error: true,
            message: message,
            type: 'UNAUTHORISED'
        });
    };

    res.forbidden = (message = 'Forbidden') => {
        return res.status(403).json({
            error: true,
            message: message,
            type: 'FORBIDDEN'
        });
    };

    res.notFound = (message = 'Not Found') => {
        return res.status(404).json({
            error: true,
            message: message,
            type: 'NOT_FOUND'
        });
    };

    res.recordExists = (message = 'Record already exists') => {
        return res.status(409).json({
            error: true,
            message: message,
            type: 'RECORD_EXISTS'
        });
    };

    res.serverError = (message = 'Server Error') => {
        return res.status(500).json({
            error: true,
            message: message,
            type: 'SERVER_ERROR'
        });
    };

    next();
};

export default responses;