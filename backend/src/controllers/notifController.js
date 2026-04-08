import prisma from "../prisma.js";

export async function createNotif(req, res){
    try {
        const userId = req.user.id;
        const {content} = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        if (!content) {
            return res.status(400).json({ message: "content is required" });
        }

        const notif = await prisma.notification.create({
            data: {
                userId, content, read:false
            }
        })
        return res.status(201).json({ notif });
    }

    catch (error){
        console.error("createNotif error: ", error);
        return res.status(500).json({ message: "Failed to create a notification" });
    }

}


export async function getNotif(req, res){

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });}

        const allNotifs = await prisma.notification.findMany({
            where: { userId },
            orderBy: {createdAt: 'desc'}
        })
        return res.status(200).json({allNotifs});
    }
    catch (error){
        console.error("getNotif error: ", error);
        return res.status(500).json({ message: "Failed to get a notification" });
    }  
}


export async function markAsRead(req, res){
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const notifId = parseInt(req.params.id);

        const notification = await prisma.notification.findFirst({
            where: { id: notifId , userId }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found"});
        }

        const updatedNotif = await prisma.notification.update({
            where: { id: notifId },
            data: { read: true }
        });

        return res.status(200).json({ notification: updatedNotif});

    }
    catch (error){
        console.error("markAsRead error: ", error);
        return res.status(500).json({ message: "Failed to mark a notification as read" });
    }
    
}


export async function deleteNotif(req, res){

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const notifId = parseInt(req.params.id);

        const notification = await prisma.notification.findFirst({
            where: { id: notifId , userId }
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found"});
        }

        await prisma.notification.delete({
            where: { id: notification.id }
        });

        return res.status(200).json({ message: "Notification removed" });
    }
    catch (error){
        console.error("deleteNotif error: ", error);
        return res.status(500).json({ message: "Failed to delete a notification" });
    }
}

export default { createNotif, getNotif, markAsRead, deleteNotif };