

# import datetime module
import datetime
import random
 
# consider the start date as 2021-february 1 st
start_date = datetime.date(2021, 2, 1)
 
# consider the end date as 2021-march 1 st
end_date = datetime.date(2021, 12, 1)
 
# delta time
delta = datetime.timedelta(days=1)

with open("data.csv", "w") as f:
    # iterate over range of dates
    f.write("Date,Mood,SleepMinutes,ActiveMinutes\n")
    while (start_date <= end_date):
        f.write(f"{start_date},{random.randint(1,6)},{random.randint(300,500)},{random.randint(12,102)}\n")
        start_date += delta
