import {CMAExtractorBS} from './CMAExtractorBS'
import { makeCMAExtractors } from './cmaExtractors';

export const CMAExtractorWorkingCap = (formData) =>{
     const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
    const BSextractors = CMAExtractorBS(formData);
     
     const currentAssets = formData?.computedData?.assetsliabilities?.CurrentAssetsArray || [];
     const currentLiabilities = formData?.computedData?.assetsliabilities?.yearlycurrentLiabilities || [];
     const repaymentrepaymentValueswithin12months = formData?.computedData?.totalLiabilities?.repaymentValueswithin12months || [];
     const workingCapitalLoanArr = BSextractors.workingCapitalLoanArr() || [];

     const midData = Array.from({length:years}).map((_, i)=>
      Number(repaymentrepaymentValueswithin12months[i] || 0)+
      Number(workingCapitalLoanArr[i] || 0)
    )
     const otherCurrLiabilities = Array.from({length:years}).map((_, i)=>
      Number(currentLiabilities[i] || 0)-
      Number(midData[i] || 0)
      
    )

    const workingCapGap = Array.from({length:years}).map((_, i)=>
    Number(currentAssets[i] || 0)-
    Number(otherCurrLiabilities[i] | 0)
    )

    const totalCurrLiabilities = Array.from({length:years}).map((_, i)=>
    Number( otherCurrLiabilities[i] || 0)+
    Number(workingCapitalLoanArr[i] || 0)
    )

    const NetWorkCap =  Array.from({length:years}).map((_, i)=>
    Number(currentAssets[i] || 0)-
    Number(totalCurrLiabilities[i] || 0)
    )

    const MinStipulatedMarginMoney = Array.from({length:years}).map((_, i)=>
        Number(Number(workingCapGap[i] || 0) * (0.25))
    )

    const MPBF = Array.from({length:years}).map((_, i)=>
        Number(workingCapGap[i] || 0)-
        Number(MinStipulatedMarginMoney[i] || 0)
    )

    const MPBF3minus6 = Array.from({length:years}).map((_, i)=>
        Number(workingCapGap[i] || 0)-
        Number(NetWorkCap[i] || 0)
    )

    const maxPermissible = Array.from({length:years}).map((_, i)=>{
      
        const maxPermissible1 =  Number(MPBF[i] || 0) > Number(MPBF3minus6[i] || 0)  ? Number(MPBF3minus6[i] || 0) : Number(MPBF[i] || 0);
         return maxPermissible1
    }
    )
    
    
    
     return {
        currentAssets:()=>currentAssets,
        otherCurrLiabilities:()=>otherCurrLiabilities,
        workingCapGap:()=> workingCapGap,
        workingCapitalLoanArr:()=>workingCapitalLoanArr,
        totalCurrLiabilities:()=>totalCurrLiabilities,
        NetWorkCap:()=>NetWorkCap ,
        MinStipulatedMarginMoney:()=>MinStipulatedMarginMoney,
        MPBF:()=>MPBF,
        MPBF3minus6:()=>MPBF3minus6,
        maxPermissible:()=>maxPermissible,

     }

}