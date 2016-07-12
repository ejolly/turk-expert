class HIT {
    HITId: string;
    HITTypeId: string; //1
    CreationTime: Date;
    HITStatus: string;
    MaxAssignments: number;
    AutoApprovalDelayInSeconds: number;
    LifetimeInSeconds: number; //1 //2
    AssignmentDurationInSeconds: number; //2
    Reward: Price;
    Title: string;  //2
    Description: string; //2
    Keywords: string;
    Question: Question;
    QualificationRequirement: QualificationRequirement;
    HITReviewStatus: HITReviewStatus;
    //conditional
    NumberofAssignmentsPending: number;
    NumberofAssignmentsAvailable: number;
    NumberofAssignmentsCompleted: number;

    //default is public
    //Overloading in TypeScript 
    constructor(title: string, description: string, assignmentDurationInSeconds: number, lifetimeInSeconds: number);
    constructor(hitTypeId: string, lifetimeInSeconds: number);
    constructor(titleOrId: string, descriptionOrSeconds: any, assignmentDurationInSeconds?: number, lifetimeInSeconds?: number) {
        //required field only
        if (typeof descriptionOrSeconds === 'number') {
            // 1.Calling CreateHIT with a HIT Type ID
            this.HITTypeId = titleOrId;
            this.LifetimeInSeconds = descriptionOrSeconds;
        } else {
            // 2.Calling CreateHIT without a HIT Type ID
            this.Title = titleOrId;
            this.Description = descriptionOrSeconds;
            this.AssignmentDurationInSeconds = assignmentDurationInSeconds;
            this.LifetimeInSeconds = lifetimeInSeconds;
        }
    }


}


interface Price {
    Amount: number;
    CurrencyCode: string; //ISO 4217 code, Default: None, Constraints: Currently, only USD is supported.
    FormattedPrice: string;
}

interface Question { //Type: either a QuestionForm (XML) or an ExternalQuestion data structure, here we go with ExternalQuestion.
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Amazon Mechanical Turk appends the following parameters to this URL: 
    // assignmentId, 
    // hitId, 
    // turkSubmitTo, 
    // workerId. 
    // For more information about these appended parameters, see the sections following this table. 
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ExternalURL: string;     //URL - Default set in config.json
    FrameHeight: number;
}

interface QualificationRequirement {
    QualificationTypeId: string;  // ref - http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_QualificationRequirementDataStructureArticle.html#ApiReference_QualificationType-IDs
    Comparator: Comparator;  // Enum - Since TypeScript 1.8
    IntegerValue: number;
    LocaleValue: Locale;
    RequiredToPreview: boolean;  // RequiredToPreview is true in order to preview the HIT.  The default is false. 
}

interface Locale {
    Country: string;  // must be a valid ISO 3166 country code
    Subdivision: string;  // must support ISO 3166-2 subdivisions. 
}


type Comparator = 'LessThan' | 'LessThanOrEqualTo' | 'GreaterThan' | 'GreaterThanOrEqualTo' | 'EqualTo' | 'NotEqualTo' | 'Exists' | 'DoesNotExist' | 'In' | 'NotIn';
// var foo: Comparator;
// foo = "LessThan";

type HITReviewStatus = 'NotReviewed' | 'MarkedForReview' | 'ReviewedAppropriate' | 'ReviewedInappropriate';


// test
let hit1 = new HIT('title', 'description', 86400, 604800);
let hit2 = new HIT('HITId-T100CN9P324W00EXAMPLE', 604800);
console.log('TEST Model - HIT: ', hit1);
console.log('TEST Model - HIT: ', hit2);

////////////////////////////////////////////////////////////////////////////
// HIT XML schema:
////////////////////////////////////////////////////////////////////////////
// <HIT>
//   <HITId>123RVWYBAZW00EXAMPLE</HITId>
//   <HITTypeId>T100CN9P324W00EXAMPLE</HITTypeId>
//   <CreationTime>2005-06-30T23:59:59</CreationTime>
//   <HITStatus>Assignable</HITStatus>
//   <MaxAssignments>5</MaxAssignments>
//   <AutoApprovalDelayInSeconds>86400</AutoApprovalDelayInSeconds>
//   <LifetimeInSeconds>86400</LifetimeInSeconds>
//   <AssignmentDurationInSeconds>300</AssignmentDurationInSeconds>
//   <Reward>
//     <Amount>25</Amount>
//     <CurrencyCode>USD</CurrencyCode>
//     <FormattedPrice>$0.25</FormattedPrice>
//   </Reward>
//   <Title>Location and Photograph Identification</Title>
//   <Description>Select the image that best represents...</Description>
//   <Keywords>location, photograph, image, identification, opinion</Keywords>
//   <Question>
//     &lt;QuestionForm&gt;
//       [XML-encoded Question data]
//     &lt;/QuestionForm&gt;
//   </Question>
//   <QualificationRequirement>
//     <QualificationTypeId>789RVWYBAZW00EXAMPLE</QualificationTypeId>
//     <Comparator>GreaterThan</Comparator>
//     <Value>18</Value>
//   </QualificationRequirement>
//   <HITReviewStatus>NotReviewed</HITReviewStatus>
// </HIT>