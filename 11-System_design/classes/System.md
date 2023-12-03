Mass:: {"type":"Lookup","options":{"autoUpdate":true,"outputType":"CustomSummarizing","builtinSummarizingFunction":"Sum","summarizedFieldName":"Mass","customListFunction":"page.file.name","customSummarizingFunction":"if(currentPage.Class.includes(\"Component\")) {return currentPage.Mass}\nelse {\nreturn pages.reduce((sum, p) => sum+ p.Mass, 0)\n}","dvQueryString":"dv.pages('\"Rocket Systems\"')","targetFieldName":"System","targetSystemToMatch":true}}
Tests:: {"type":"Lookup","options":{"autoUpdate":true,"outputType":"CustomBulletList","builtinSummarizingFunction":"Count","customListFunction":"\"[[\" + page.file.name + \"]]\\t\" + (page.Status == \"success\" ? \"✅\" : \"❌\")","customSummarizingFunction":"return pages.length","dvQueryString":"dv.pages('\"Tests\"')","targetFieldName":"System"}}
Interfacing with:: {"type":"Canvas","options":{"direction":"bothsides","nodeColors":[],"edgeColors":[],"edgeFromSides":[],"edgeToSides":[],"edgeLabels":[],"canvasPath":"System Diagram.canvas","filesFromDVQuery":""}}
System:: {"type":"Select","options":{"valuesList":{},"sourceType":"ValuesFromDVQuery","valuesListNotePath":"","valuesFromDVQuery":"dv.pages('\"Rocket Systems\"').map(p => console.log(p.ID))"}}

ID:: {"type":"Formula","options":{"autoUpdate":true,"formula":"current"}}
Interfaces:: {"type":"Lookup","options":{"autoUpdate":false,"targetSystemToMatch":true,"outputType":"CustomBulletList","builtinSummarizingFunction":"Count","customListFunction":"page.file.name","customSummarizingFunction":"return pages.length","dvQueryString":"dv.pages('\"Interfaces\"')","targetFieldName":"System"}}
Subsystems:: {"type":"CanvasGroup","options":{"groupColors":[],"groupLabels":[],"canvasPath":"System Diagram.canvas"}}

ID:: {"type":"Formula","options":{"autoUpdate":true,"formula":"current"}}