const express = require('express');
const router = express.Router();
const { createJob, getJobStatus, updateJob } = require('../jobs/jobManager');
const { scrapeBubbleTeaMenu } = require('../scrappers/bubbleTeaScraper');

router.post('/scrape', async (req, res) => {
    const { urls } = req.body;
    if (!urls || !urls.length) return res.status(400).json({ error: 'No URLs provided' });

    const jobId = createJob(urls);

    // Start async scraping
    (async () => {
        const results = [];
        for (const url of urls) {
            const data = await scrapeBubbleTeaMenu(url);
            results.push(data);
        }
        updateJob(jobId, results);
    })();

    res.json({ jobId });
});

router.get('/status/:jobId', (req, res) => {
    const status = getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: 'Job not found' });
    res.json(status);
});

module.exports = router;
