class EvernoteUtils
  class << self
    def humanize_date time
      date = time.to_date
      today = Date.today
      human_date = date.strftime("%b %d, %Y")
      if (date == today)
        human_date = "Today"
      elsif (date == today + 1)
        human_date = "Tomorrow"
      elsif (date == today - 1)
        human_date = "Yesterday"
      end
      human_date + " at "+ time.strftime("%I:%M%p")
    end
  end
end
