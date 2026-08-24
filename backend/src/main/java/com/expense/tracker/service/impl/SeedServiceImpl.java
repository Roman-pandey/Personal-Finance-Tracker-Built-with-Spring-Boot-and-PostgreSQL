package com.expense.tracker.service.impl;

import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.Expense;
import com.expense.tracker.entity.Income;
import com.expense.tracker.entity.User;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.IncomeRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SeedServiceImpl implements SeedService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, Object> seedData(String email, boolean forceReset) {
        String targetEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : "demo@example.com";

        // Find or create target user
        User user = userRepository.findByEmail(targetEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setName("Demo User");
            newUser.setEmail(targetEmail);
            newUser.setPassword(passwordEncoder.encode("password123"));
            return userRepository.save(newUser);
        });

        // Ensure default categories exist
        Map<String, Category> expenseCategories = ensureCategories("EXPENSE", List.of(
                "Food", "Transportation", "Shopping", "Entertainment", "Bills",
                "Health", "Education", "Travel", "Groceries", "Rent", "Utilities", "Other"
        ));

        Map<String, Category> incomeCategories = ensureCategories("INCOME", List.of(
                "Salary", "Freelance", "Bonus", "Investment", "Contest Earning",
                "Scholarship", "Refund", "Business", "Other"
        ));

        long existingCount = expenseRepository.findByUserId(user.getId()).size();
        if (!forceReset && existingCount >= 10) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SKIPPED");
            response.put("message", "User already has " + existingCount + " expense records. Use forceReset=true to overwrite.");
            response.put("expensesCount", existingCount);
            return response;
        }

        // Clear existing user records if force reset or count < 10
        expenseRepository.deleteByUserId(user.getId());
        incomeRepository.deleteByUserId(user.getId());

        Random random = new Random(42); // Deterministic seed generator
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(365);

        List<Expense> expenseList = new ArrayList<>();
        List<Income> incomeList = new ArrayList<>();

        // Generate Expenses & Incomes month by month
        for (int monthOffset = 12; monthOffset >= 0; monthOffset--) {
            LocalDate monthStart = today.minusMonths(monthOffset).withDayOfMonth(1);
            int daysInMonth = monthStart.lengthOfMonth();

            // 1. Monthly Income: Salary on 1st of month
            LocalDate salaryDate = monthStart.withDayOfMonth(Math.min(1, daysInMonth));
            if (!salaryDate.isAfter(today)) {
                incomeList.add(Income.builder()
                        .title("Monthly Salary")
                        .amount(new BigDecimal(65000 + random.nextInt(15000)))
                        .category(incomeCategories.get("Salary"))
                        .date(salaryDate)
                        .notes("Direct deposit salary credit")
                        .user(user)
                        .build());
            }

            // 2. Monthly Expense: House Rent on 2nd of month
            LocalDate rentDate = monthStart.withDayOfMonth(Math.min(2, daysInMonth));
            if (!rentDate.isAfter(today)) {
                expenseList.add(Expense.builder()
                        .title("House Rent")
                        .amount(new BigDecimal(16500))
                        .category(expenseCategories.get("Rent"))
                        .date(rentDate)
                        .paymentMethod("BANK_TRANSFER")
                        .notes("Monthly apartment rent payment")
                        .user(user)
                        .build());
            }

            // 3. Monthly Bills on 5th and 6th
            LocalDate elecDate = monthStart.withDayOfMonth(Math.min(5, daysInMonth));
            if (!elecDate.isAfter(today)) {
                expenseList.add(Expense.builder()
                        .title("Electricity Utility Bill")
                        .amount(new BigDecimal(1800 + random.nextInt(1200)))
                        .category(expenseCategories.get("Bills"))
                        .date(elecDate)
                        .paymentMethod("UPI")
                        .notes("Monthly electricity charges")
                        .user(user)
                        .build());
            }

            LocalDate netDate = monthStart.withDayOfMonth(Math.min(6, daysInMonth));
            if (!netDate.isAfter(today)) {
                expenseList.add(Expense.builder()
                        .title("Airtel Fiber Internet")
                        .amount(new BigDecimal(1179))
                        .category(expenseCategories.get("Bills"))
                        .date(netDate)
                        .paymentMethod("CREDIT_CARD")
                        .notes("High-speed broadband plan")
                        .user(user)
                        .build());
            }

            // 4. Subscriptions
            LocalDate subDate1 = monthStart.withDayOfMonth(Math.min(10, daysInMonth));
            if (!subDate1.isAfter(today)) {
                expenseList.add(Expense.builder()
                        .title("Netflix Premium Subscription")
                        .amount(new BigDecimal(649))
                        .category(expenseCategories.get("Entertainment"))
                        .date(subDate1)
                        .paymentMethod("CREDIT_CARD")
                        .notes("Monthly 4K streaming plan")
                        .user(user)
                        .build());
            }

            LocalDate subDate2 = monthStart.withDayOfMonth(Math.min(14, daysInMonth));
            if (!subDate2.isAfter(today)) {
                expenseList.add(Expense.builder()
                        .title("Spotify Music Premium")
                        .amount(new BigDecimal(179))
                        .category(expenseCategories.get("Entertainment"))
                        .date(subDate2)
                        .paymentMethod("UPI")
                        .notes("Family audio plan")
                        .user(user)
                        .build());
            }

            // 5. Groceries (4-5 per month)
            int[] groceryDays = {3, 9, 16, 23, 28};
            String[] groceryTitles = {
                    "BigBasket Grocery Order", "Supermarket Monthly Staples",
                    "Blinkit Fresh Vegetables", "Milk & Organic Provisions", "Weekly Fruits & Supplies"
            };
            for (int i = 0; i < groceryDays.length; i++) {
                int day = Math.min(groceryDays[i], daysInMonth);
                LocalDate gDate = monthStart.withDayOfMonth(day);
                if (!gDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(450 + random.nextInt(2500)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(groceryTitles[i % groceryTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Groceries"))
                            .date(gDate)
                            .paymentMethod(getRandomMethod(random, "UPI", "CREDIT_CARD", "CASH"))
                            .notes("Essential food & kitchen items")
                            .user(user)
                            .build());
                }
            }

            // 6. Food & Dining (10-12 per month)
            String[] foodTitles = {
                    "Breakfast at South Indian Cafe", "Swiggy Lunch Delivery", "Zomato Gourmet Dinner",
                    "Starbucks Coffee & Muffin", "Dominos Pizza Outing", "Dinner with Friends",
                    "Chai & Samosa Evening Break", "KFC Bucket Meal", "Artisan Bakery Snacks",
                    "Subway Sandwich Meal", "Local Dhaba Lunch", "Dessert & Ice Cream"
            };
            for (int f = 0; f < 10; f++) {
                int day = 1 + random.nextInt(daysInMonth);
                LocalDate fDate = monthStart.withDayOfMonth(day);
                if (!fDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(80 + random.nextInt(1100)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(foodTitles[f % foodTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Food"))
                            .date(fDate)
                            .paymentMethod(getRandomMethod(random, "UPI", "CASH", "CREDIT_CARD"))
                            .notes("Food & dining expense")
                            .user(user)
                            .build());
                }
            }

            // 7. Transportation (8-10 per month)
            String[] transportTitles = {
                    "Uber Ride to Office", "Ola Auto Booking", "Petrol Refill for Bike",
                    "Metro Smart Card Recharge", "Bus Ticket for Commute", "Cab Fare to Station"
            };
            for (int t = 0; t < 8; t++) {
                int day = 1 + random.nextInt(daysInMonth);
                LocalDate tDate = monthStart.withDayOfMonth(day);
                if (!tDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(70 + random.nextInt(1200)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(transportTitles[t % transportTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Transportation"))
                            .date(tDate)
                            .paymentMethod(getRandomMethod(random, "UPI", "CASH", "DEBIT_CARD"))
                            .notes("Travel commute fare")
                            .user(user)
                            .build());
                }
            }

            // 8. Shopping (2-3 per month)
            String[] shopTitles = {
                    "Amazon Electronics Order", "Levi's Denim Jeans", "Flipkart Sale Apparel",
                    "Mobile Phone Case & Glass", "Nike Running Shoes", "Casual Cotton Shirts"
            };
            for (int s = 0; s < 3; s++) {
                int day = 1 + random.nextInt(daysInMonth);
                LocalDate sDate = monthStart.withDayOfMonth(day);
                if (!sDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(350 + random.nextInt(5500)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(shopTitles[s % shopTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Shopping"))
                            .date(sDate)
                            .paymentMethod(getRandomMethod(random, "CREDIT_CARD", "UPI", "DEBIT_CARD"))
                            .notes("Personal shopping item")
                            .user(user)
                            .build());
                }
            }

            // 9. Health & Fitness (1-2 per month)
            String[] healthTitles = {
                    "Apollo Pharmacy Prescription Medicines", "Doctor Specialist Consultation",
                    "Gym Monthly Membership Fee", "Dental Care & Cleaning"
            };
            int hDay = Math.min(18, daysInMonth);
            LocalDate hDate = monthStart.withDayOfMonth(hDay);
            if (!hDate.isAfter(today)) {
                BigDecimal amount = new BigDecimal(300 + random.nextInt(2200)).setScale(2, RoundingMode.HALF_UP);
                expenseList.add(Expense.builder()
                        .title(healthTitles[monthOffset % healthTitles.length])
                        .amount(amount)
                        .category(expenseCategories.get("Health"))
                        .date(hDate)
                        .paymentMethod(getRandomMethod(random, "UPI", "CREDIT_CARD", "CASH"))
                        .notes("Medical / Wellness care")
                        .user(user)
                        .build());
            }

            // 10. Education (Selected months: 11, 8, 5, 2)
            if (monthOffset == 11 || monthOffset == 8 || monthOffset == 5 || monthOffset == 2) {
                String[] eduTitles = {
                        "Udemy Spring Boot & React Course", "Technical Books Purchase",
                        "Coursera Professional Certification", "Online Skill Exam Fee"
                };
                LocalDate eduDate = monthStart.withDayOfMonth(Math.min(21, daysInMonth));
                if (!eduDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(499 + random.nextInt(2500)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(eduTitles[monthOffset % eduTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Education"))
                            .date(eduDate)
                            .paymentMethod("CREDIT_CARD")
                            .notes("Learning course material")
                            .user(user)
                            .build());
                }
            }

            // 11. Travel (Selected months: 10, 6, 3, 1)
            if (monthOffset == 10 || monthOffset == 6 || monthOffset == 3 || monthOffset == 1) {
                String[] travelTitles = {
                        "Goibibo Hotel Stay Booking", "IndiGo Flight Ticket to Destination",
                        "IRCTC Train Ticket to Hometown", "Weekend Beach Resort Package"
                };
                LocalDate trvDate = monthStart.withDayOfMonth(Math.min(22, daysInMonth));
                if (!trvDate.isAfter(today)) {
                    BigDecimal amount = new BigDecimal(3200 + random.nextInt(12000)).setScale(2, RoundingMode.HALF_UP);
                    expenseList.add(Expense.builder()
                            .title(travelTitles[monthOffset % travelTitles.length])
                            .amount(amount)
                            .category(expenseCategories.get("Travel"))
                            .date(trvDate)
                            .paymentMethod("CREDIT_CARD")
                            .notes("Vacation travel booking")
                            .user(user)
                            .build());
                }
            }

            // 12. Extra Incomes: Freelance, Bonus, Investment, Refunds
            if (monthOffset % 2 == 0) {
                LocalDate freeDate = monthStart.withDayOfMonth(Math.min(18, daysInMonth));
                if (!freeDate.isAfter(today)) {
                    String[] freeTitles = {"Freelance Web Dashboard Project", "Spring Boot REST API Contract", "UI Redesign Consultation"};
                    incomeList.add(Income.builder()
                            .title(freeTitles[monthOffset % freeTitles.length])
                            .amount(new BigDecimal(12000 + random.nextInt(24000)))
                            .category(incomeCategories.get("Freelance"))
                            .date(freeDate)
                            .notes("Client project milestone payment")
                            .user(user)
                            .build());
                }
            }

            if (monthOffset == 9 || monthOffset == 3) {
                LocalDate invDate = monthStart.withDayOfMonth(Math.min(25, daysInMonth));
                if (!invDate.isAfter(today)) {
                    incomeList.add(Income.builder()
                            .title("Stock Investment Dividend Payout")
                            .amount(new BigDecimal(2500 + random.nextInt(9000)))
                            .category(incomeCategories.get("Investment"))
                            .date(invDate)
                            .notes("Quarterly dividend credit")
                            .user(user)
                            .build());
                }
            }

            if (monthOffset == 7 || monthOffset == 1) {
                LocalDate refDate = monthStart.withDayOfMonth(Math.min(27, daysInMonth));
                if (!refDate.isAfter(today)) {
                    incomeList.add(Income.builder()
                            .title("Amazon Product Returned Refund")
                            .amount(new BigDecimal(850 + random.nextInt(4500)))
                            .category(incomeCategories.get("Refund"))
                            .date(refDate)
                            .notes("Item return credit refund")
                            .user(user)
                            .build());
                }
            }

            if (monthOffset == 6) {
                LocalDate bonusDate = monthStart.withDayOfMonth(Math.min(15, daysInMonth));
                if (!bonusDate.isAfter(today)) {
                    incomeList.add(Income.builder()
                            .title("Mid-Year Performance Bonus")
                            .amount(new BigDecimal(35000))
                            .category(incomeCategories.get("Bonus"))
                            .date(bonusDate)
                            .notes("Company performance appraisal bonus")
                            .user(user)
                            .build());
                }
            }
        }

        // Additional transactions for today and recent 7 days
        for (int d = 0; d < 7; d++) {
            LocalDate rDate = today.minusDays(d);
            expenseList.add(Expense.builder()
                    .title(d == 0 ? "Today's Evening Snacks & Coffee" : "Recent Daily Grocery & Snack")
                    .amount(new BigDecimal(120 + random.nextInt(450)).setScale(2, RoundingMode.HALF_UP))
                    .category(expenseCategories.get("Food"))
                    .date(rDate)
                    .paymentMethod("UPI")
                    .notes("Recent daily expense item")
                    .user(user)
                    .build());
        }

        expenseRepository.saveAll(expenseList);
        incomeRepository.saveAll(incomeList);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Successfully seeded realistic demo data!");
        response.put("userEmail", targetEmail);
        response.put("expensesCount", expenseList.size());
        response.put("incomesCount", incomeList.size());
        response.put("startDate", startDate.toString());
        response.put("endDate", today.toString());
        response.put("expenseCategoriesCount", expenseCategories.size());
        response.put("incomeCategoriesCount", incomeCategories.size());

        return response;
    }

    @Override
    public Map<String, Object> clearSeedData(String email) {
        String targetEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : "demo@example.com";
        User user = userRepository.findByEmail(targetEmail).orElseThrow(() -> new RuntimeException("User not found: " + targetEmail));

        long countExpenses = expenseRepository.findByUserId(user.getId()).size();
        long countIncomes = incomeRepository.findByUserId(user.getId()).size();

        expenseRepository.deleteByUserId(user.getId());
        incomeRepository.deleteByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Cleared dummy records for " + targetEmail);
        response.put("deletedExpenses", countExpenses);
        response.put("deletedIncomes", countIncomes);

        return response;
    }

    private Map<String, Category> ensureCategories(String type, List<String> categoryNames) {
        Map<String, Category> map = new HashMap<>();
        for (String name : categoryNames) {
            Category category = categoryRepository.findByNameAndType(name, type)
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(name)
                            .type(type)
                            .user(null)
                            .build()));
            map.put(name, category);
        }
        return map;
    }

    private String getRandomMethod(Random random, String... methods) {
        return methods[random.nextInt(methods.length)];
    }
}
