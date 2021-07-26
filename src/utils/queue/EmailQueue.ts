import Bull from "bull"
// import nodemailer from "nodemailer"
import { CredentialRepository} from "../../repository"
import { Mutex } from "async-mutex"
const clientLock = new Mutex()

//Initialise UpdateToSchedulerQueue Queue
export const EmailQueue = new Bull("Email", process.env.REDIS_HOST ?? "")

EmailQueue.process(async (job: any, done: any) => {
  //locking the thread
  // const release = await clientLock.acquire()

  try {
  
  //   if(job.data.isVerified!==undefined) {
  //       if(job.data.isVerified) {
  //           //set up credentials
  //           delete job.data.isVerified                        
  //           await CredentialRepository._insert(job.data.origin,job.data)
  //           //send email to the participant
  //           const transporter = nodemailer.createTransport({
  //               host: "smtp.mailtrap.io",
  //               port: 2525,
  //               auth: {
  //                 user: "8cdd402c4a3f6f",
  //                 pass: "6c895aedc6f46d"
  //               }
  //             });
           
  // // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: '"Diig admin" <admin@diig.com>', // sender address
  //   to: "linock007@example.com, baz@example.com", // list of receivers
  //   subject: "DiiG:Account Created", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // console.log("Message sent: %s", info.messageId);    
  //       }
  //     }
    // release()
   
  } catch (error) {
    //release the lock for thread
    // release()
    // console.log(`released job on exception- ${job.data.activity_id}`)
  }
  done()

})
