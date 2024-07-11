const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name:{
    type:String
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }]
}, {
  timestamps: true,
  collection: 'ChatRooms'
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
