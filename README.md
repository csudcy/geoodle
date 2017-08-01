# Geoodle

**Find places to meet people!**

Have you ever used [doodle.com](https://doodle.com) (the most **awesome** event planning service ever)? Ever sorted out the date then had arguments about where to go? That's where geoodle comes in!


# Shoutouts

Cool things which inspired me or I'm making use of in this project (in no particular order):
* [doodle.com](https://doodle.com) - the most **awesome** event planning service ever
* [Material Design Icons](https://material.io/icons/) - cool icons
* [Heroku](https://heroku.com) - excellent hosting service (free tier is perfect for small apps)
* [Emitter](https://github.com/component/emitter) - add events to your JS objects


# TODO

* ~~MVP:~~
  * ~~A map~~
  * ~~Click to add points~~
    * ~~Anywhere you would like to be near (home, work, stations you pass through etc.)~~
    * ~~Suggestions of where to go~~
  * ~~Click points to remove them~~
  * ~~Shows the geographical midpoint~~
  * ~~Client-side only (state is in the URL)~~
* Second Version
  * ~~Add participants~~
  * ~~Only remove icons of the currently active participant~~
  * ~~Make point/suggestion a single toggle button~~
  * ~~Add [Noty](http://ned.im/noty/) for notifications~~
  * ~~Auto create participants & select a participant if necessary~~
  * ~~Better style for participant control~~
  * ~~Add descriptions for points/suggestions~~
  * ~~On map click, if the info window is open, close it~~
  * ~~Give random names/colours/labels~~
  * ~~Show description on hover~~
  * ~~On infowindow open, focus on the description & select all~~
  * ~~Set your mode of transport~~
  * ~~Show approximate transport times/routes~~
  * ~~Use geocoding instead of random names~~
  * On transport times:
    * ~~Show participant colour~~
    * ~~Show participant transport mode~~
    * ~~Show suggestion colour~~
    * ~~Sort participants, places & suggestions by name~~
    * Show best & worst times
    * Show total best/worst times
    * Show max times
    * Show best max time
  * ~~Allow multiple Geoodles~~
  * ~~Move Geoodle data to it's own class~~
  * ~~Move styles to CSS~~
  * Move to localStorage
  * Import/Export Geoodles
  * People can vote on which suggestions they like (or refuse to go to!)
  * Search for places
  * Confirm Geoodle/participant deletion
  * Show/Hide participants
  * Duplicate Geoodle?
  * Duplicate participant?
  * BUG: Hover window flickers while dragging
  * BUG: Hover/Info window don't show marker type
  * Make transport time a datatable
* Serverside version
  * Login (by name to start with, by social login later)
  * Create a Geoodle
  * Make everything work!
  * Don't allow editing other peoples markers
* Misc
  * Make loading more robust


Things which might come later:

* Multiple polls on a single map
* Discussions?


# Collaborative Editing Thoughts

Single Geoodle data structure:
```json
{
  "add_mode": "point",
  "id": 0,
  "name": "Geoodle Alpha",
  "participants": [
    {
      "color": "#ff8000",
      "id": 0,
      "markers": [
        {
          "id": 0,
          "label": "Home",
          "position": {
            "lat": 51.50358707830748,
            "lng": -0.2343606948852539
          },
          "type": "point"
        },
        ...
      ],
      "name": "Nick",
      "transport_mode": "transit"
    },
    ...
  ],
  "selected_participant_id": "0"
}
```

Todo:
* Change IDs to UUIDs
* Change lists to dicts


Operation set structure:
```json
{
  # When server distributes
  "parent_version": "<version>",
  "object_id": "<object_id>",
  "operations": [
    {
      "key_path": ["<key>", ...],
      "old_value": "<JSON dump>",
      "new_value": "<JSON dump>",
    },
    ...
  ]
}
```


## General

* Only objects & primitives (no arrays)
* Operation is defined by existence of old_value & new_value:
  * Create = !old_value, new_value
  * Updatge = old_value, new_value
  * Delete = old_value, !new_value
  * Otherwise, error
* Key_path is a list of 1 or more keys
  * I.e. Top level is an object (not primitive)


## Server Side - Receive

* Reject the operation set if:
  * Path does not exist (except the last segment of a create)
  * Old_value passed != local
* Apply the edit
* Increment the version
* Send edit to all clients


## Client Side - Edit

* On apply:
  * Create the operation set which would be sent to the server
  * Attempt to apply it locally
  * If successful, send to server
  * ? Pre-emptively apply to local ?
    * Might need to give operation sets IDs & keep a local track of which sets have been applied?
    * Might lead to out-of-order operations?
      * Should be ok because of checking old_value?

```javascript
let collaborative_object = CollaborativeObject('<id>');

// YOU MUST NOT EDIT OBJECTS RETRIEVED LIKE THIS!
collaborative_object.get(''); //Returns the whole object
collaborative_object.get('<key>.<key>...');

let operations = OperationSet(collaborative_object);
operations.create('<key>.<key>...');
operations.update('<key>.<key>...', object);
operations.delete('<key>.<key>...');
operations.apply()
```


## Client Side - Receive

* Resync with server if:
  * Parent_version passed != local
  * Path does not exist (except the last segment of a create)
  * Old_value passed != local
* Apply the edit
* Increment the version
