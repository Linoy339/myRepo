import Bull from "bull"
import { CredentialRepository} from "../../repository"
import { Mutex } from "async-mutex"
const clientLock = new Mutex()

//Initialise UpdateToSchedulerQueue Queue
export const EmailQueue = new Bull("Email", process.env.REDIS_HOST ?? "")

EmailQueue.process(async (job: any, done: any) => {
  //locking the thread
  const release = await clientLock.acquire()

  try {
  
    if(job.data.isVerified!==undefined) {
        if(job.data.isVerified) {
            //set up credentials
            delete job.data.isVerified                        
            await CredentialRepository._insert(job.data.origin,job.data)
            //send email to the participant
        }
      }
    release()
   
  } catch (error) {
    //release the lock for thread
    release()
    console.log(`released job on exception- ${job.data.activity_id}`)
  }
  done()

})
