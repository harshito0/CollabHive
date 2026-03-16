const Project = require('../models/projectModel');

exports.createProject = async (req, res) => {
  const { title, description, tech_stack } = req.body;
  const projectData = {
    title,
    description,
    tech_stack,
    project_owner: req.user.id,
  };
  const projectId = await Project.create(projectData);
  res.status(201).json({ id: projectId, ...projectData });
};

exports.getAllProjects = async (req, res) => {
  const projects = await Project.getAll();
  res.json(projects);
};

exports.joinProject = async (req, res) => {
  const { projectId } = req.body;
  await Project.addMemberRequest(projectId, req.user.id);
  res.json({ success: true, message: 'Join request sent' });
};

exports.getProjectMembers = async (req, res) => {
  const members = await Project.getMembers(req.params.id);
  res.json(members);
};

exports.getUserProjects = async (req, res) => {
  const projects = await Project.getByOwner(req.params.userId);
  res.json(projects);
};

exports.approveMember = async (req, res) => {
  const { projectId, userId, status } = req.body;
  // In a real app, verify req.user.id is the project owner
  await Project.updateMemberStatus(projectId, userId, status);
  res.json({ success: true, message: `Member ${status}` });
};
