This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


##  Shadcn Components  
- Use only the existing shadcn components (listed below). They're already set up and located in `src/components`.
- Example usage:
```typescript
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { CustomComponentYouMade } from "@/components/custom-component-you-made";
```

## List of available shadcn components:  
```
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, buttonb, calendar, card, 
checkbox, collapsible, command, context-menu, dialog, dropdown-menu, hover-card, input, 
label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, 
separator, sheet, skeleton, slider, switch, table, tabs, textarea, toast, toaster, 
toggle-group, toggle, tooltip, use-toast
```

## Additional Libraries  
- If you need packages like `next-themes`, `recharts`, etc., install them using `npm`.