const ERBuildModel = require('../models/ERBuildModel');

const getAllBuildsFromGame = async (request, response) => {
  try {
    const builds = await ERBuildModel.find({}).populate('user', { username: 1, name: 1 });
    response.status(200).json(builds);
  } catch (error) {
    response.status(500).json({ error: 'internal server error' });
  }
};

const getUserBuildsFromGame = async (request, response) => {
  try {
    if (request.token) {
      const builds = await ERBuildModel.find({ user: request.user.id });
      return response.json(builds);
    } else if (request.anonymousUserId) {
      const builds = await ERBuildModel.find({ anonymousUserId: request.anonymousUserId });
      return response.json(builds);
    }

    response.status(401).json({ error: 'unauthorized' });
  } catch (error) {
    response.status(500).json({ error: 'internal server error' });
  }
};

const getBuildById = async (request, response) => {
  try {
    const build = await ERBuildModel.findById(request.params.id).populate('user', { username: 1, name: 1 });
    if (build) {
      response.json(build);
    } else {
      response.status(404).json({ error: 'build not found' });
    }
  } catch (error) {
    response.status(400).json({ error: 'invalid build id' });
  }
};

const postBuild = async (request, response) => {
  try {
    const buildToSave = new ERBuildModel(request.body);

    if (request.user) {
      buildToSave.user = request.user._id;
      delete buildToSave.anonymousUserId;
      delete buildToSave.expiresAt;
    } else if (request.anonymousUserId) {
      // Set to 30 days from the save -> days * hours * minutes * seconds * miliseconds
      // const expireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const expireDate = new Date(Date.now() + 60 * 1000); // 1 minute for development & manual tests

      buildToSave.anonymousUserId = request.anonymousUserId;
      buildToSave.expiresAt = expireDate;
    }

    const savedBuild = await buildToSave.save();

    if (request.user) {
      console.log(request.user);
      request.user.builds.eldenRing = request.user.builds.eldenRing.concat(savedBuild._id);
      await request.user.save();
    }

    response.json(savedBuild);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

function isAuthorized(build, user, anonymousUserId) {
  if (user && build.user && build.user.toString() === user.id) return true;
  if (anonymousUserId && build.anonymousUserId === anonymousUserId) return true;
  return false;
}

const updateBuildById = async (request, response) => {
  try {
    const buildToUpdate = await ERBuildModel.findById(request.params.id);

    if (!buildToUpdate) {
      return response.status(404).json({ error: 'build not found' });
    }

    if (!isAuthorized(buildToUpdate, request.user, request.anonymousUserId)) {
      return response.status(403).json({ error: 'permission denied' });
    }

    const newBuild = request.body;

    if (request.user) {
      delete newBuild.anonymousUserId;
      delete newBuild.expiresAt;
    } else if (request.anonymousUserId) {
      // Renewed to 30 days from the update -> days * hours * minutes * seconds * miliseconds
      // const renewedExpireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const renewedExpireDate = new Date(Date.now() + 60 * 1000); // 1 minute for development & manual tests
      newBuild.expiresAt = renewedExpireDate;
    }

    const updatedBuild = await ERBuildModel.findByIdAndUpdate(request.params.id, newBuild, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    response.json(updatedBuild);
  } catch (error) {
    response.status(400).json({ error: 'failed to update build', error });
  }
};

const deleteBuildById = async (request, response) => {
  try {
    const buildToDelete = await ERBuildModel.findById(request.params.id);

    if (!buildToDelete) {
      return response.status(404).json({ error: 'build not found' });
    }

    if (!isAuthorized(buildToDelete, request.user, request.anonymousUserId)) {
      return response.status(403).json({ error: 'permission denied' });
    }

    if (request.user) {
      request.user.builds.eldenRing = request.user.builds.eldenRing.filter(
        (buildId) => buildId.toString() !== request.params.id
      );
      await request.user.save();
    }

    await ERBuildModel.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    response.status(400).json({ error: 'failed to delete build' });
  }
};

module.exports = {
  getAllBuildsFromGame,
  getUserBuildsFromGame,
  getBuildById,
  postBuild,
  updateBuildById,
  deleteBuildById
};
