// ---------- ERROR CODE DB ROUTES ---------- //
app.get('/api/error-codes', requireAuth, async (req, res) => {
    try {
        const { search, errorType, severity } = req.query;
        let filter = {};
        
        console.log('Search request:', { search, errorType, severity });
        
        if (search) {
            filter.$or = [
                { errorCode: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { symptoms: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (errorType) filter.errorType = errorType;
        if (severity) filter.severity = severity;
        
        const errorCodes = await ErrorCode.find(filter).sort({ errorCode: 1 });
        console.log('Found error codes:', errorCodes.length);
        
        res.json(errorCodes);
    } catch (error) {
        console.error('Error fetching error codes:', error);
        res.status(500).json({ error: 'Failed to fetch error codes' });
    }
});

app.get('/api/error-codes/:code', requireAuth, async (req, res) => {
    try {
        const errorCode = await ErrorCode.findOne({ 
            errorCode: req.params.code.toUpperCase() 
        });
        
        if (!errorCode) {
            return res.status(404).json({ error: 'Error code not found' });
        }
        
        res.json(errorCode);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch error code' });
    }
});
