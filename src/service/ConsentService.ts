import { Request, Response, Router } from "express"
import { Participant } from "../model/Participant"
import { ParticipantRepository } from "../repository/ParticipantRepository"
import { ConsentRepository } from "../repository/ConsentRepository"
import { SecurityContext, ActionContext, _verify } from "./Security"
import jsonata from "jsonata"
import { TypeRepository } from "../repository"
import { PubSubAPIListenerQueue } from "../utils/queue/PubSubAPIListenerQueue"
export const ConsentService = Router()
ConsentService.post("/consent/:study_id/participant", async (req: Request, res: Response) => {
  try {
    let study_id = req.params.study_id
    let output:any = {}
    const participant = req.body
    if(!!participant.email) {
    study_id = await _verify(req.get("Authorization"), ["self", "sibling", "parent"], study_id)
    output= { data: await ParticipantRepository._insert(study_id, participant) }
    participant.participant_id =  output['data'].id    
    await ConsentRepository._insert(study_id, participant)
    participant.study_id = study_id
    participant.action = "create"
    } else {
        throw new Error("500.email-required")
    } 
    res.json(output)
  } catch (e) {
    if (e.message === "401.missing-credentials") res.set("WWW-Authenticate", `Basic realm="LAMP" charset="UTF-8"`)
    res.status(parseInt(e.message.split(".")[0]) || 500).json({ error: e.message })
  }
})
ConsentService.put("/consent/:participant_id", async (req: Request, res: Response) => {
  try {
    let participant_id = req.params.participant_id
    const participant = req.body
    participant_id = await _verify(req.get("Authorization"), ["self", "sibling", "parent"], participant_id)
    const output = { data: await ParticipantRepository._update(participant_id, participant) }
    participant.participant_id = participant_id
    participant.action = "update"

    
    res.json(output)
  } catch (e) {
    if (e.message === "401.missing-credentials") res.set("WWW-Authenticate", `Basic realm="LAMP" charset="UTF-8"`)
    res.status(parseInt(e.message.split(".")[0]) || 500).json({ error: e.message })
  }
})
// TODO: activity/* and sensor/* entry
