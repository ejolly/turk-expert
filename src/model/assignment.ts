class ASSIGNMENT { //Rename: Due to duplicate identifier with ts
    AssignmentId: string;
    WorkerId: string;
    HITId: string;
    AssignmentStatus: AssignmentStatus;
    AutoApprovalTime: Date;
    AcceptTime: Date;
    SubmitTime: Date;
    ApprovalTime: Date;
    RejectionTime: Date;
    Deadline: Date;
    Answer: QuestionFormAnswers; // user external app, may be empty.
    RequesterFeedback: string; // default none
    //ADD when we save assignments !!!
    code: string;


    constructor(assignmentId: string, workerId:string, hitId: string) {
        this.AssignmentId = assignmentId;
        this.WorkerId = workerId;
        this.HITId = hitId;
    }
}

type AssignmentStatus = 'Submitted' | 'Approved' | 'Rejected';

interface QuestionFormAnswers{
  QuestionIdentifier:string;
  //optional
  FreeText: string;
  SelectionIdentifier: string;
}




////////////////////////////////////////////////////////////////////////////
// test
////////////////////////////////////////////////////////////////////////////
// let task = new ASSIGNMENT('AssignmentId-GYFTRHZ5J3DZREY48WNZE38ZR9RR1ZPMXGWE7WE0','WorkerId-AD20WXZZP9XXK', 'HITId-GYFTRHZ5J3DZREY48WNZ');
// console.log('TEST Model - Assignment: ', task);

declare var module: any;
module.exports = ASSIGNMENT;