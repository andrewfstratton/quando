package character

const (
	FIXED_SPACE         = "&nbsp;"
	DOUBLE_QUOTE        = "&quot;"
	VALUE               = "⚡"
	TEXT                = "❓"
	ON_OFF              = "❗"
	NO_tEXT             = "❔"
	PLUS_MINUS          = "±"
	DOCUMENT            = "📄"
	CAMERA              = "📷"
	TV                  = "📺"
	LEAP_MOTION         = "👋"
	HAND_WAVE           = "🖐"
	HAND_POINT_LEFT     = "👈"
	HAND_POINT_RIGHT    = "👉"
	ROBOT_HEAD          = "🤖"
	RAINBOW             = "🌈"
	GIFT                = "🎁"
	PAGER               = "📟"
	A                   = "🅰"
	B                   = "🅱"
	MESSAGE             = "📡"
	ALARM_CLOCK         = "⏰"
	SPEAKER             = "🔊"
	BRAIN               = "🧠"
	MAGNFIER            = "🔍"
	MOUSE               = "🖱️"
	KEYBOARD            = "⌨️"
	JOYSTICK            = "🕹️️️️️"
	STICK               = "📍️️"
	GAMEPAD             = "🎮️️"
	COG                 = "️⚙️"
	FOOTPRINTS          = "👣️️"
	FLOPPY_DISK         = "💾"
	MUSIC_KEYBOARD      = "🎹"
	NOTE                = "🎵"
	DRUM                = "🥁"
	ARROWS_LEFT_RIGHT   = "⇔"
	ARROWS_UP_DOWN      = "⇕"
	ARROWS_IN_OUT       = "⤢"
	ARROWS_ROTATE       = "⤹⤸"
	ARROW_UP            = "⇧"
	ARROW_DOWN          = "⇩"
	ARROW_LEFT          = "⇦"
	ARROW_RIGHT         = "⇨"
	ARROW_IN            = "⬀"
	ARROW_OUT           = "⬃"
	ARROW_UP_THEN_LEFT  = "↰"
	ARROW_UP_THEN_RIGHT = "↱"
)

type Character struct {
	txt string
}

func New(t string) *Character {
	return &Character{txt: t}
}

func (ch *Character) Html() string {
	return ch.txt
}
