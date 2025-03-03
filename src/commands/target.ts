import Logger from "../util/Logger";
import Interface, { Command } from "./Interface";
import findBestMatch from "../util/stringSimilarity";
import SRServer from "../server/kcp/SRServer";
import Session from "../server/kcp/Session";
const c = new Logger("/target", "blue");

export default async function handle(command: Command) {
    const target = command.args[0];
    const possibleTargets: {
        id: string;
        session: Session;
        uid: number;
    }[] = [];

    SRServer.getInstance().sessions.forEach(client => {
        possibleTargets.push({
            id: `${client.ctx.address}:${client.ctx.port}`,
            uid: client.player.uid,
            session: client
        });
    });

    if (!target) {
        c.log("No target specified");
        c.log("Possible targets: ");
        possibleTargets.forEach(x => c.trail(`${x.id} (UID: ${x.uid})`));
        if(!possibleTargets[1] && possibleTargets[0]){
            c.log(`Auto target the only session ${possibleTargets[0].uid}`);
            Interface.target = possibleTargets[0].session;
        } 
        return;
    }

    const autoTarget = findBestMatch(target, possibleTargets.map(x => x.id))?.bestMatch.target;

    Interface.target = possibleTargets.find(x => x.id === autoTarget)!.session;

    c.log(`Target set to ${autoTarget}`);
}