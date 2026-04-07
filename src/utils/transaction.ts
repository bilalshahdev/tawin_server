import mongoose, { ClientSession } from 'mongoose';

/**
 * A wrapper to handle Mongoose transactions safely.
 * @param work A function containing the DB operations. It receives the session.
 */
export const runInTransaction = async <T>(
    work: (session: ClientSession) => Promise<T>
): Promise<T> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await work(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};