import api from './axios_config'

export const getUsersChat = async()=>{
    try {
        const {data} = await api.get("/chats");
        return data;
    } catch (error) {
        console.error("Error fetching chats:",error)
        throw error;
    }
}