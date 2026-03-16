const Team = require('../models/teamModel');

exports.createTeam = async (req, res) => {
  const { team_name } = req.body;
  const teamId = await Team.create(team_name, req.user.id);
  res.status(201).json({ id: teamId, team_name, created_by: req.user.id });
};

exports.getAllTeams = async (req, res) => {
  const teams = await Team.getAll();
  res.json(teams);
};

exports.getTeamById = async (req, res) => {
  const team = await Team.getById(req.params.id);
  if (team) {
    res.json(team);
  } else {
    res.status(404);
    throw new Error('Team not found');
  }
};
