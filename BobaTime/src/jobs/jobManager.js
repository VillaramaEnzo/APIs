const { v4: uuidv4 } = require('uuid');

const jobs = {};

function createJob(urls) {
    const jobId = uuidv4();
    jobs[jobId] = { status: 'pending', urls, result: null };
    return jobId;
}

function updateJob(jobId, result) {
    if (jobs[jobId]) {
        jobs[jobId].status = 'completed';
        jobs[jobId].result = result;
    }
}

function getJobStatus(jobId) {
    return jobs[jobId] || null;
}

module.exports = { createJob, updateJob, getJobStatus };
