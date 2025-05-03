
const dgram = require('node:dgram')
const dnspacket= require('dns-packet')
const server = dgram.createSocket('udp4')
const db ={
"google.com":{
    data:'1.2.3.4',
type:'A'

},
"yahoo.com":{
    data:'hidenode.network',
type:'CNAME'

},
}


server.on('message', (msg, rinfo) => {
    const incoming = dnspacket.decode(msg);
    const question = incoming.questions[0];
    const questionName = question.name.replace(/\.$/, '');
  
    console.log('Received query:', question);
  
    // Only handle 'A' queries
    if (question.type !== 'A') {
      console.log('Unsupported query type:', question.type);
      const response = dnspacket.encode({
        type: 'response',
        id: incoming.id,
        flags: dnspacket.AUTHORITATIVE_ANSWER,
        questions: incoming.questions,
        answers: [] // No answer
      });
      server.send(response, rinfo.port, rinfo.address);
      return;
    }
  
    const ipfromDB = db[questionName];
    const answers = [];
  
    if (ipfromDB) {
      answers.push({
        type: ipfromDB.type,
        class: 'IN',
        name: questionName,
        ttl: 300,
        data: ipfromDB.data
      });
    }
  
    const response = dnspacket.encode({
      type: 'response',
      id: incoming.id,
      flags: dnspacket.AUTHORITATIVE_ANSWER,
      questions: incoming.questions,
      answers
    });
  
    server.send(response, rinfo.port, rinfo.address);
  });
  
server.bind(8053,()=> console.log('DNS IS RUNNING ON 53'))
