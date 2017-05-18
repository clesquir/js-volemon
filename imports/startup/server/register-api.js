import '/imports/api/achievements/server/publications.js';
import '/imports/api/home/server/methods.js';
import '/imports/api/home/server/publications.js';
import '/imports/api/profiles/server/profileCreation.js';
import '/imports/api/users/server/methods.js';

//Migrations
import '/imports/api/achievements/server/migrations/initialAchievements.js';
import '/imports/api/profiles/server/migrations/numberOfShutouts.js';
import '/imports/api/profiles/server/migrations/numberOfShutoutLosses.js';
import '/imports/api/achievements/server/migrations/userInitialAchievements.js';
