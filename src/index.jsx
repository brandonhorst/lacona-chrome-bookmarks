/** @jsx createElement */
import _ from 'lodash'
import { createElement } from 'elliptical'
import { runApplescript } from 'lacona-api'
import { onActivate } from 'lacona-source-helpers'
import { URL } from 'lacona-phrases'

const FETCH_SCRIPT = `
  if is_running("Google Chrome") then
    set chromeTabs to run script "
      set allTabs to {}
      tell application \\"Google Chrome\\"
        repeat with fold in every bookmark folder
          repeat with mark in fold's bookmark items
            set end of allTabs to {mark's id, mark's title, mark's URL}
          end repeat
        end repeat
      end tell
      return allTabs
    "
  end if

  on is_running(appName)
    tell application "System Events" to (name of processes) contains appName
  end is_running
`

async function fetchChromeBookmarks () {
  console.log('doing', FETCH_SCRIPT)
  const result = await runApplescript({script: FETCH_SCRIPT})
  console.log('r', result)
  const tabs = _.chain(result || [])
    .map(item => ({
      id: item[0],
      title: item[1],
      url: item[2]
    }))
    .value()

  console.log(tabs)

  return tabs
}

const BookmarkSource = onActivate(fetchChromeBookmarks, [])

export const ChromeBookmark = {
  extends: [URL],

  describe ({observe}) {
    const bookmarks = observe(<BookmarkSource />)

    const items = _.map(bookmarks, bookmark => ({
      text: bookmark.title,
      value: bookmark.url
    }))

    return (
      <placeholder argument='bookmark'>
        <list items={items} limit={10} strategy='fuzzy' />
      </placeholder>
    )
  }
}

export const extensions = [ChromeBookmark]
