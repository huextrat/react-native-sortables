const path = require('path');
const getWorkspaces = require('get-yarn-workspaces');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const workspaces = getWorkspaces(__dirname).filter(
  // Include all workspaces except fabric in the paper example
  workspaceDir => !workspaceDir.includes('fabric')
);

const customConfig = {
  watchFolders: [path.resolve(__dirname, '../../node_modules'), ...workspaces]
};

module.exports = mergeConfig(getDefaultConfig(__dirname), customConfig);
