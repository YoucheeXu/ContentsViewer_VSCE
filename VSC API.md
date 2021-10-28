## [Programmatically executing a command](https://code.visualstudio.com/api/extension-guides/command)



```typescript
import * as vscode from 'vscode';

function commentLine() {
  vscode.commands.executeCommand('editor.action.addCommentLine');
}
```



# Built-in Commands

`editorScroll` - Scroll editor in the given direction

- Editor scroll argument object

   \- Property-value pairs that can be passed through this argument:

  - 'to': A mandatory direction value.

    ```
    'up', 'down'
    ```

  - 'by': Unit to move. Default is computed based on 'to' value.

    ```
    'line', 'wrappedLine', 'page', 'halfPage'
    ```

  - 'value': Number of units to move. Default is '1'.

  - 'revealCursor': If 'true' reveals the cursor if it is outside view port.

`revealLine` - Reveal the given line at the given logical position

- Reveal line argument object

   \- Property-value pairs that can be passed through this argument:

  - 'lineNumber': A mandatory line number value.

  - 'at': Logical position at which line has to be revealed.

    ```
    'top', 'center', 'bottom'
    ```



## TreeView

https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider

