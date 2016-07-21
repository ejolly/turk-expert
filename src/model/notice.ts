class NOTICE {
    WorkerId: string; // The ID of the Worker to notify, as returned by the GetAssignmentsForHIT operation. 
    Subject: string;
    MessageText: string;

    constructor(id: string, subject:string, messageText:string) {
        this.WorkerId = id;
        this.Subject = name;
        this.MessageText = messageText;
    }
}


////////////////////////////////////////////////////////////////////////////
// test
////////////////////////////////////////////////////////////////////////////
// let notice = new NOTICE('WorkerId-AD20WXZZP9XXK','Hello', 'Thank you for your time!');
// console.log('TEST Model - Notice: ', notice);

declare var module: any;
module.exports = NOTICE;