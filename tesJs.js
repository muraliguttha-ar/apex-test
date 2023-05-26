function validationOnNext(name){  
    const response = {};
    let ASbcbsCount = 0;
    let ASbcnCount = 0;
    let activeSegments = 0;
    let retireeSegments = 0;
    const full_json = this.parseJson(this.omniJsonData);
    const finalGroupSegmentsPlans = full_json?.finalGroupSegmentsPlans ? full_json?.finalGroupSegmentsPlans : full_json?.Package;
    let ProductSelection = full_json?.Productselection;
    finalGroupSegmentsPlans.forEach((plan) => {
        //Changes Start here Adding this change to update the IsBcbsmChanged correctly as it will be used in the PART-B sponser field as per that logic.
        plan.isCarChange = false;
        if(plan.medicalType != plan.oldMedicalType && plan.medicalType){
            plan.isCarChange = true;
        }
        //Changes End here Adding this change to update the IsBcbsmChanged correctly as it will be used in the PART-B sponser field as per that logic.
        if (plan.isCarChange && plan.medicalType == 'BCBS' && plan.oldMedicalType == 'BCN') {
            response.IsBcbsmChanged = true;
        }
        if (plan.segmentType == 'Retiree')  retireeSegments += 1;
        else {
            if (plan.medicalType == 'BCN')  
                ASbcnCount++;
            else 
                ASbcbsCount++;
            activeSegments += 1;
        }
    });
    response.retireeMoreThanActive = false;
    response.retireeBCBS = false;
    response.retireeBCN = false;
    if(retireeSegments > activeSegments)
        response.retireeMoreThanActive = true;
    
    let ASbcnOnly = ASbcbsCount === 0 ? true: false;
    let ASbcbsOnly = ASbcnCount === 0 ? true: false;
    if (ProductSelection?.retireeSegmentRadio == 'No') {
        finalGroupSegmentsPlans.forEach( (plan) => {
            let foundIndex = finalGroupSegmentsPlans.findIndex(plan => plan.segmentType == 'Retiree');
            if (foundIndex !== -1) { 
                finalGroupSegmentsPlans.splice(foundIndex, 1); 
                response.finalGroupSegmentsPlans = finalGroupSegmentsPlans;
                this.finalGroupSegmentsPlans     = finalGroupSegmentsPlans;
            }
        });
    }
    finalGroupSegmentsPlans.forEach((plan) =>{	
        if(plan.segmentType == 'Retiree')
        {
            if(ASbcnOnly && plan.medicalType == 'BCBS')
                response.retireeBCBS = true;
            if(ASbcbsOnly && plan.medicalType == 'BCN')
                response.retireeBCN = true;
        }
    }); 
    this.omniApplyCallResp(response);
}
// Default Dental package data if it is "Not Offered"
function defaultDentalNotOffered(pckgs){
    this.isDentalRemoved = true; 
    this.omniApplyCallResp({isDentalRemoved:this.isDentalRemoved});
    pckgs.isDenVolStr = '';
    pckgs.dentalPlan = 'Not Offered';
    pckgs.denPrdId = 'NOD';
    pckgs.dentalOrtho = '';
    pckgs.denVolType = '';
    pckgs.denVolContains = '';
    pckgs.denPrdCode = '';
    return pckgs;
}
// Default Vision package data if it is "Not Offered"
function defaultVisionNotOffered(pckgs){
    pckgs.isVisVolStr = '';
    pckgs.visionPlan = 'Not Offered';
    pckgs.visPrdId = 'NOV';
    pckgs.visVolType = '';
    pckgs.visVolContains = '';
    pckgs.visPrdCode = '';
    return pckgs;
}
export {validationOnNext, defaultDentalNotOffered, defaultVisionNotOffered};