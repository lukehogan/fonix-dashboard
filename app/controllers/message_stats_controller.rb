class MessageStatsController < ApplicationController

  def index
    @message_stats = message_stats
  end

  # API
  def daily_stats
    render json: message_stats
  end

  private

  def message_stats
    (1..10).map do |index|
      {
        sent: rand(50..60),
        failures: rand(10..15),
        successful: rand(50..60),
        created_at: Date.today + index.days
      }
    end
  end
end


 # - creates table in erb file.
 # - build graphs for failed, success and sent totals.
 # - switch between graphs and table.
