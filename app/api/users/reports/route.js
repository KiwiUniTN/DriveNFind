import { authorizeRole } from "@/app/middleware/auth";

//TODO:modificarfe la documentazione
export default async function handler(req, res) {
  const { method, query } = req;
  const { reportId } = query;
  const isAdmin = await authorizeRole(["admin"])(req);

  switch (method) {
    case 'GET':
      if (user.role === 'admin') {
        // Admins can only view, not create or modify reports
        return res.status(403).json({ error: 'Admin users can only view reports' });
      }
      // Logic to get reports (all or by ID)
      if (reportId) {
        const report = await getReportById(reportId);
        if (report) {
          return res.status(200).json(report);
        } else {
          return res.status(404).json({ error: 'Report not found' });
        }
      } else {
        const reports = await getAllReportsForUser(user.username);
        return res.status(200).json(reports);
      }

    case 'POST':
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Admin users cannot create reports' });
      }
      const newReport = req.body;
      const createdReport = await createReportForUser(user.username, newReport);
      return res.status(201).json(createdReport);

    case 'PATCH':
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Admin users cannot update reports' });
      }
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }
      const updatedData = req.body;
      const updatedReport = await updateReportById(reportId, updatedData, user.username);
      if (updatedReport) {
        return res.status(200).json(updatedReport);
      } else {
        return res.status(404).json({ error: 'Report not found or update failed' });
      }

    case 'DELETE':
      if (user.role === 'admin') {
        return res.status(403).json({ error: 'Admin users cannot delete reports' });
      }
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }
      const deletionSuccess = await deleteReportById(reportId, user.username);
      if (deletionSuccess) {
        return res.status(204).end();
      } else {
        return res.status(404).json({ error: 'Report not found or deletion failed' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} not allowed`);
  }
}

async function getReportById(reportId) {
  // Database query or data fetching logic here
}

async function getAllReportsForUser(username) {
  // Database query or data fetching logic here
}

async function createReportForUser(username, reportData) {
  // Database insertion logic here
}

async function updateReportById(reportId, updatedData, username) {
  // Database update logic here
}

async function deleteReportById(reportId, username) {
  // Database deletion logic here
}
