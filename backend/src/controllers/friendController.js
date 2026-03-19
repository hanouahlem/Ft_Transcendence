import prisma from "../prisma.js";
import jwt from 'jsonwebtoken';


export async function addFriend(req, res) {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "receiverId is required" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId }
        });

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = await prisma.friends.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        const request = await prisma.friends.create({
            data: {
                senderId,
                receiverId,
                status: "pending"
            }
        });

        return res.status(201).json({
            message: "Friend request sent",
            request
        });
    } catch (error) {
        console.error("addFriend error:", error);
        return res.status(500).json({ message: "Failed to send friend request" });
    }
}

export async function getFriends(req , res){
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const friends = await prisma.friends.findMany({
            where: {
                AND : [
                    { status: "accepted"},
                    { OR: [{senderId:userId}, {receiverId: userId}]}
                ]},
            
               include: {
                            sender: { select: { id: true, username: true, avatar: true } },
                            receiver: { select: { id: true, username: true, avatar: true } }
}
            });

        const friendsList = friends.map(f => {
            return f.senderId === userId ? f.receiver : f.sender;
        });

        if (friends.length === 0) {
            return res.json([]);
            }

        return res.status(200).json(friendsList);//envoyer la liste a res
    }
    catch (error) {
        console.error("getFriends error: ", error);
        return res.status(500).json({message: "Failed to get Friends"});
    }

}

export async function acceptFriend(req, res) {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "userId required" });
        }

        const requestId = parseInt(req.params.id);

        const friends = await prisma.friends.findUnique({
            where: { id: requestId }
        });

        if (!friends) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friends.receiverId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (friends.status !== "pending") {
            return res.status(400).json({ message: "Request already handled" });
        }

        const updatedFriend = await prisma.friends.update({
            where: { id: requestId },
            data: { status: "accepted" }
        });

        return res.status(200).json({ friend: updatedFriend });
    } catch (error) {
        console.error("acceptFriend error:", error);
        return res.status(500).json({ message: "Failed to accept friend" });
    }
}


export async function deleteFriend(req, res) {
    try {
        const userId = req.user.id;

        const friendId = parseInt(req.params.id); // ← req.params.id pas req.body

        const friend = await prisma.friends.findFirst({
            where: {
                id: friendId,
                OR: [{ senderId: userId }, { receiverId: userId }]
            }
        });

        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }

        await prisma.friends.delete({
            where: { id: friend.id }
        });

        return res.status(200).json({ message: "Friend removed" });
    } catch (error) {
        console.error("deleteFriend error:", error);
        return res.status(500).json({ message: "Failed to delete friend" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const userId = req.user.id;

        const requests = await prisma.friends.findMany({
            where: {
                receiverId: userId,
                status: "pending"
            },
            include: {
                sender: { select: { id: true, username: true, avatar: true } }
            }
        });

        return res.status(200).json(requests);
    } catch (error) {
        console.error("getFriendRequests error:", error);
        return res.status(500).json({ message: "Failed to get friend requests" });
    }
}

export default { addFriend, getFriends, acceptFriend, deleteFriend, getFriendRequests };
