const {ipcMain} = require("electron");
const {GetProfileInfo, GetRecentSetName, GetRecentSetProfile, GetRecentSetPic} = require("../../data/memo");
const {
    GetRecentFollow, GetFollowers, GetFollowing, GetPost, GetPosts, GetLikes, GetPostReplies, GetPostParent
} = require("../../data/tables");
const {Handlers} = require("../../common/util");

const ProfileHandlers = () => {
    ipcMain.handle(Handlers.GetProfileInfo, async (e, addresses) => GetProfileInfo(addresses))
    ipcMain.handle(Handlers.GetRecentSetName, async (e, addresses) => GetRecentSetName(addresses))
    ipcMain.handle(Handlers.GetRecentSetProfile, async (e, addresses) => GetRecentSetProfile(addresses))
    ipcMain.handle(Handlers.GetRecentSetPic, async (e, addresses) => GetRecentSetPic(addresses))
    ipcMain.handle(Handlers.GetRecentFollow, async (e, addresses, address) => GetRecentFollow(addresses, address))
    ipcMain.handle(Handlers.GetFollowing, async (e, addresses) => GetFollowing(addresses))
    ipcMain.handle(Handlers.GetFollowers, async (e, addresses) => GetFollowers(addresses))
    ipcMain.handle(Handlers.GetLikes, async (e, txHash) => GetLikes(txHash))
    ipcMain.handle(Handlers.GetPost, async (e, {txHash, userAddresses}) => GetPost({txHash, userAddresses}))
    ipcMain.handle(Handlers.GetPosts, async (e, {addresses, userAddresses}) => GetPosts({addresses, userAddresses}))
    ipcMain.handle(Handlers.GetPostParent, async (e, {txHash, userAddresses}) => GetPostParent({txHash, userAddresses}))
    ipcMain.handle(Handlers.GetPostReplies, async (e, {txHash, userAddresses}) =>
        GetPostReplies({txHash, userAddresses}))
}

module.exports = {
    ProfileHandlers: ProfileHandlers,
}
