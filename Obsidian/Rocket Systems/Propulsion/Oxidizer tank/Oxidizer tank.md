---
Class:
  - System
System: TWR2.PROP
ID: TWR2.PROP.OXIDIZER_TANK
Interfacing with: 
---
Mass: (Mass:: 0)
### Requirements List: 
- Weight should not exceed 4000 g
- Diameter should not exceed 200 mm

### Requirements:
```dataview
TABLE 
```

## Tests
```dataviewjs
let pages = dv.pages('"Tests"');
let render = [];
for (let page of pages) {
	render.push(`- <p style='display:flex; justify-content:space-between; width: 30%'><a>${page.file.name}</a><span>${(page.Status === "success" ? "✅" : "❌")}</span></p>`);
}
dv.paragraph(render);
```

### Interfaces
- bolted on bottom end
- bolted on top end

#### Oxidizer Tank

^a85245

this is oxidizer tank